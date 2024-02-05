import { setupMountedComponents } from '@bihealth/reev-frontend-lib/lib/testUtils'
import { describe, expect, it } from 'vitest'
import { VMenu } from 'vuetify/components'

import ACMGCriteriaDocs from '@/views/ACMGCriteriaDocs.vue'

describe.concurrent('ACMGCriteriaDocs', async () => {
  it('renders the header', async () => {
    // arrange:
    const { wrapper } = await setupMountedComponents(
      { component: ACMGCriteriaDocs },
      {
        initialStoreState: {
          misc: {
            appVersion: 'v0.0.0'
          }
        }
      }
    )

    // act: nothing, only test rendering

    // assert:
    const logo = wrapper.find('#logo')
    const menu = wrapper.findComponent(VMenu)
    expect(logo.exists()).toBe(true)
    expect(menu.exists()).toBe(true)
  })

  it('renders the main content', async () => {
    // arrange:
    const { wrapper } = await setupMountedComponents(
      { component: ACMGCriteriaDocs },
      {
        initialStoreState: {
          misc: {
            appVersion: 'v0.0.0'
          }
        }
      }
    )

    // act: nothing, only test rendering

    // assert:
    const mainContent = wrapper.find('.docs-view')
    expect(mainContent.exists()).toBe(true)
    expect(mainContent.html()).toMatch('PVS1')
    expect(mainContent.html()).toMatch('Benign Criteria')
    expect(mainContent.html()).toMatch('BP1')
  })
})
