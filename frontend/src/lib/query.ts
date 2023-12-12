/**
 * Code implementing the query strategy.
 */
import { type RouteLocationRaw } from 'vue-router'

import { AnnonarsClient } from '@/api/annonars'
import { DottyClient } from '@/api/dotty'
import { type GenomeBuild } from '@/lib/genomeBuilds'
import {
  ParseError,
  type Seqvar,
  type Strucvar,
  parseCanonicalSpdiSeqvar,
  parseIscnCnv,
  parseSeparatedSeqvar,
  parseSeparatedStrucvar
} from '@/lib/genomicVars'

/**
 * Attempt to translate the variant with dotty to SPDI.
 *
 * @param queryTerm   The query term to lookup.
 * @param genomeBuild The genome build to use for projection to genome.
 *
 * @throws ParseError if the query to dotty succeeds but dotty failed
 * @throws Error in all other cases
 */
export async function lookupWithDotty(
  queryTerm: string,
  genomeBuild: GenomeBuild
): Promise<Seqvar> {
  const dottyClient = new DottyClient()
  const result = await dottyClient.toSpdi(queryTerm, genomeBuild === 'grch37' ? 'GRCh37' : 'GRCh38')

  if (result && result?.success) {
    const spdi = result.value
    return {
      chrom: spdi.contig,
      pos: spdi.pos,
      del: spdi.reference_deleted,
      ins: spdi.alternate_inserted,
      genomeBuild,
      userRepr: queryTerm
    }
  } else {
    throw new ParseError(`Could not resolve variant with dotty: ${queryTerm}`)
  }
}

/**
 * Attempt to obtain a seqvar from the given query term.
 *
 * This will first try to parse the variant with regex locally, and
 * fall back to resolution in the backend otherwise.
 *
 * @param queryTerm   Query term to parse.
 * @param genomeBuild Genome build to use as default/fallback.
 *
 * @throws ParseError if the query term cannot be resolved as a seqvar
 * @throws Error in all other cases
 */
export async function resolveSeqvar(queryTerm: string, genomeBuild: GenomeBuild): Promise<Seqvar> {
  try {
    return parseSeparatedSeqvar(queryTerm, genomeBuild)
  } catch (err) {
    if (err instanceof ParseError) {
      // swallow parse error and try next, position errors bubble up
    } else {
      // otherwise, re-throw
      throw err
    }
  }

  try {
    return parseCanonicalSpdiSeqvar(queryTerm)
  } catch (err) {
    if (err instanceof ParseError) {
      // swallow parse error and try next, position errors bubble up
    } else {
      // otherwise, re-throw
      throw err
    }
  }

  try {
    return await lookupWithDotty(queryTerm, genomeBuild)
  } catch (err) {
    if (err instanceof ParseError) {
      // swallow parse error and try next, position errors bubble up
    } else {
      // otherwise, re-throw
      throw err
    }
  }

  // placholder: dbSNP lookup here
  // placeholder: ClinVar identifier lookup here

  throw new Error(`Did not resolve as seqvar: ${queryTerm}`)
}

/**
 * Attempt to obtain a strucvar from the given query term.
 *
 * @param queryTerm   Query term to parse.
 * @param genomeBuild Genome build to use as default/fallback.
 *
 * @throws Error if the query term cannot be parsed as a strucvar.
 */
export function resolveStrucvar(queryTerm: string, genomeBuild: GenomeBuild): Strucvar {
  try {
    return parseSeparatedStrucvar(queryTerm, genomeBuild)
  } catch (err) {
    if (err instanceof ParseError) {
      // swallow parse error and try next, position errors bubble up
    } else {
      // otherwise, re-throw
      throw err
    }
  }

  try {
    return parseIscnCnv(queryTerm, genomeBuild)
  } catch (err) {
    if (err instanceof ParseError) {
      // swallow parse error and try next, position errors bubble up
    } else {
      // otherwise, re-throw
      throw err
    }
  }

  throw new Error(`Did not parse as strucvar: ${queryTerm}`)
}

/**
 * Information about a gene as returned by the API gene lookup.
 */
export interface GeneInfo {
  name: string
  symbol: string
  alias_name?: string[]
  alias_symbol?: string[]
  ensembl_gene_id?: string
  hgnc_id: string
  ncbi_gene_id: string
}

/**
 * Item returned by the API gene lookup.
 */
export interface ScoredGeneInfo {
  score: number
  data: GeneInfo
}

/**
 * Result of the API gene lookup.
 */
export interface GeneLookupResult {
  genes: ScoredGeneInfo[]
}

/**
 * Exception thrown in GeneLookup if there was not exactly one entry.
 */
export class NotOneGeneInfo extends Error {
  entries: ScoredGeneInfo[]

  constructor(message: string, entries: ScoredGeneInfo[]) {
    super(message)

    this.entries = entries
  }
}

/**
 * Attempt to lookup the given gene via annonars.
 *
 * @param queryTerm The query term to use for lookup.
 * @param field The field to return.
 *
 * @returns The official gene HGNC symbol.
 * @throws NotOneGeneInfo if more than one entry was found.
 * @throws Error if the gene could not be found.
 */
export async function lookupGene(
  queryTerm: string,
  field: 'geneSymbol' | 'hgncId' = 'geneSymbol'
): Promise<string> {
  const annonarsClient = new AnnonarsClient()
  const data = (await annonarsClient.fetchGenes(queryTerm)) as GeneLookupResult
  for (const { data: gene } of data.genes) {
    if (gene.symbol.toLowerCase() === queryTerm.toLowerCase()) {
      if (field == 'geneSymbol') {
        return gene.symbol
      } else {
        return gene.hgnc_id
      }
    } else if (
      (gene.alias_symbol ?? []).find((alias) => alias.toLowerCase() === queryTerm.toLowerCase())
    ) {
      if (field == 'geneSymbol') {
        return gene.symbol
      } else {
        return gene.hgnc_id
      }
    }
  }

  throw new NotOneGeneInfo('did not find exactly one gene', data.genes)
}

/**
 * Perform the query logic as described in the documentation.
 *
 * @throws NotOneGeneInfo Fell through to gene lookup and 0 or 2+ genes were found.
 * @throws Error In the case of other errors.
 */
export async function performQuery(
  queryTerm: string,
  genomeBuild: GenomeBuild
): Promise<RouteLocationRaw> {
  // Attempt to parse as sequence variant.
  try {
    const seqvar = await resolveSeqvar(queryTerm, genomeBuild)
    const { chrom, pos, del, ins, genomeBuild: gb, userRepr } = seqvar
    return {
      name: 'seqvar-details',
      params: {
        seqvar: `${gb}-${chrom}-${pos}-${del}-${ins}`
      },
      query: {
        orig: userRepr
      }
    }
  } catch (err) {
    // did not parse as seqvar, continue
  }

  // Attempt to parse as structural variant.
  try {
    const strucvar = resolveStrucvar(queryTerm, genomeBuild)
    const { svType, genomeBuild: gb, chrom, start, stop, userRepr } = strucvar
    return {
      name: 'strucvar-details',
      params: {
        strucvar: `${svType}-${gb}-${chrom}-${start}-${stop}`
      },
      query: {
        orig: userRepr
      }
    }
  } catch (err) {
    // did not parse as seqvar, continue
  }

  // Attempt to lookup as gene.
  try {
    const geneSymbol = await lookupGene(queryTerm)
    return {
      name: 'gene-details',
      params: {
        gene: geneSymbol
      },
      query: {
        genomeBuild: genomeBuild
      }
    }
  } catch (err) {
    // re-throw explicitely here
    throw err
  }
}