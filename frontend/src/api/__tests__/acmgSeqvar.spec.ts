import { beforeEach, describe, expect, it, vi } from 'vitest'
import createFetchMock from 'vitest-fetch-mock'

import { AcmgSeqVarClient } from '@/api/acmgSeqvar'
import { SeqvarImpl } from '@/lib/genomicVars'
import { type AcmgRatingBackend } from '@/stores/seqvarAcmgRating'

const fetchMocker = createFetchMock(vi)

const seqVar = new SeqvarImpl('grch37', '1', 123, 'A', 'G')
const mockAcmgRating: AcmgRatingBackend = {
  comment: 'exampleComment',
  criterias: [
    {
      criteria: 'Pm1',
      presence: 'Present',
      evidence: 'Pathogenic Moderate'
    }
  ]
}

describe.concurrent('AcmgSeqVar Client', () => {
  beforeEach(() => {
    fetchMocker.enableMocks()
    fetchMocker.resetMocks()
  })

  it('lists ACMG ratings correctly', async () => {
    fetchMocker.mockResponse(JSON.stringify([mockAcmgRating]))

    const client = new AcmgSeqVarClient()
    const result = await client.listAcmgRatings()

    expect(result).toEqual([mockAcmgRating])
  })

  it('fails to list ACMG ratings', async () => {
    fetchMocker.mockResponse((req) => {
      if (req.url.includes('acmgSeqvar/list')) {
        return Promise.resolve(JSON.stringify({ status: 500 }))
      }
      return Promise.resolve(JSON.stringify({ status: 400 }))
    })

    const client = new AcmgSeqVarClient()
    const result = await client.listAcmgRatings()

    expect(result).toEqual({ status: 500 })
  })

  it('fetches ACMG rating correctly', async () => {
    fetchMocker.mockResponse(JSON.stringify(mockAcmgRating))

    const client = new AcmgSeqVarClient()
    const result = await client.fetchAcmgRating(seqVar)

    expect(result).toEqual(mockAcmgRating)
  })

  it('fails to fetch ACMG rating', async () => {
    fetchMocker.mockResponse((req) => {
      if (req.url.includes('acmgSeqvar/get')) {
        return Promise.resolve(JSON.stringify({ status: 500 }))
      }
      return Promise.resolve(JSON.stringify({ status: 400 }))
    })

    const client = new AcmgSeqVarClient()
    const result = await client.fetchAcmgRating(seqVar)

    expect(result).toEqual({ status: 500 })
  })

  it('saves ACMG rating correctly', async () => {
    fetchMocker.mockResponse(JSON.stringify(mockAcmgRating))

    const client = new AcmgSeqVarClient()
    const result = await client.saveAcmgRating(seqVar, mockAcmgRating)

    expect(result).toEqual(mockAcmgRating)
  })

  it('fails to save ACMG rating', async () => {
    fetchMocker.mockResponse((req) => {
      if (req.url.includes('acmgSeqvar/create')) {
        return Promise.resolve(JSON.stringify({ status: 500 }))
      }
      return Promise.resolve(JSON.stringify({ status: 400 }))
    })

    const client = new AcmgSeqVarClient()
    const result = await client.saveAcmgRating(seqVar, mockAcmgRating)

    expect(result).toEqual({ status: 500 })
  })

  it('updates ACMG rating correctly', async () => {
    fetchMocker.mockResponse(JSON.stringify(mockAcmgRating))

    const client = new AcmgSeqVarClient()
    const result = await client.updateAcmgRating(seqVar, mockAcmgRating)

    expect(result).toEqual(mockAcmgRating)
  })

  it('fails to update ACMG rating', async () => {
    fetchMocker.mockResponse((req) => {
      if (req.url.includes('acmgSeqvar/update')) {
        return Promise.resolve(JSON.stringify({ status: 500 }))
      }
      return Promise.resolve(JSON.stringify({ status: 400 }))
    })

    const client = new AcmgSeqVarClient()
    const result = await client.updateAcmgRating(seqVar, mockAcmgRating)

    expect(result).toEqual({ status: 500 })
  })

  it('deletes ACMG rating correctly', async () => {
    fetchMocker.mockResponse(JSON.stringify({}))

    const client = new AcmgSeqVarClient()
    const result = await client.deleteAcmgRating(seqVar)

    expect(result).toEqual({})
  })

  it('fails to delete ACMG rating', async () => {
    fetchMocker.mockResponse((req) => {
      if (req.url.includes('acmgSeqvar/delete')) {
        return Promise.resolve(JSON.stringify({ status: 500 }))
      }
      return Promise.resolve(JSON.stringify({ status: 400 }))
    })

    const client = new AcmgSeqVarClient()
    const result = await client.deleteAcmgRating(seqVar)

    expect(result).toEqual({ status: 500 })
  })
})