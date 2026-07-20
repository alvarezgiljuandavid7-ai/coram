import { createClient } from '@supabase/supabase-js'

const PRODUCTION_REF = 'qbjcqnhgijsotmdzccmi'
const STAGING_REF = 'zcizkqqhxecfrjuqwaej'
const EXPECTED_CONFIRMATION = `${PRODUCTION_REF}:${STAGING_REF}`
const BATCH_SIZE = 50

type HymnalCollection = {
  id: string
  slug: string
  name: string
  description: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

type Hymn = {
  id: string
  collection_id: string
  legacy_id: string | null
  hymn_number: number | null
  title: string
  slug: string
  original_key: string | null
  lyrics: string
  chords: string[]
  is_published: boolean
  search_text?: string | null
  created_at: string
  updated_at: string
  status: string
}

function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

function projectRefFromUrl(value: string): string {
  const hostname = new URL(value).hostname
  const [ref, ...suffix] = hostname.split('.')
  if (!ref || suffix.join('.') !== 'supabase.co') {
    throw new Error(`Expected a Supabase project URL, received: ${hostname}`)
  }
  return ref
}

async function main() {
  const confirmation = process.argv[2]
  if (confirmation !== EXPECTED_CONFIRMATION) {
    throw new Error(
      `Explicit confirmation required. Run with: ${EXPECTED_CONFIRMATION}`,
    )
  }

  const productionUrl = requireEnvironment('CORAM_PRODUCTION_SUPABASE_URL')
  const productionKey = requireEnvironment(
    'CORAM_PRODUCTION_SUPABASE_PUBLISHABLE_KEY',
  )
  const stagingUrl = requireEnvironment('CORAM_STAGING_SUPABASE_URL')
  const stagingServiceKey = requireEnvironment(
    'CORAM_STAGING_SUPABASE_SERVICE_ROLE_KEY',
  )

  const productionRef = projectRefFromUrl(productionUrl)
  const stagingRef = projectRefFromUrl(stagingUrl)
  if (productionRef !== PRODUCTION_REF || stagingRef !== STAGING_REF) {
    throw new Error(
      `Ref mismatch. Expected ${EXPECTED_CONFIRMATION}; received ${productionRef}:${stagingRef}`,
    )
  }
  if (productionRef === stagingRef) {
    throw new Error('Source and destination projects must be different.')
  }

  const production = createClient(productionUrl, productionKey, {
    auth: { persistSession: false },
  })
  const staging = createClient(stagingUrl, stagingServiceKey, {
    auth: { persistSession: false },
  })

  const [{ data: collections, error: collectionsError }, corariosBefore] =
    await Promise.all([
      production
        .from('hymnal_collections')
        .select('*')
        .eq('is_published', true)
        .returns<HymnalCollection[]>(),
      staging.from('corarios').select('id', { count: 'exact', head: true }),
    ])
  if (collectionsError) throw collectionsError
  if (corariosBefore.error) throw corariosBefore.error

  const { data: hymns, error: hymnsError } = await production
    .from('hymns')
    .select('*')
    .eq('status', 'published')
    .eq('is_published', true)
    .order('hymn_number')
    .returns<Hymn[]>()
  if (hymnsError) throw hymnsError
  if (!collections?.length || !hymns?.length) {
    throw new Error('Production returned no published hymnal content.')
  }

  const collectionIds = new Set(collections.map(({ id }) => id))
  if (hymns.some(({ collection_id }) => !collectionIds.has(collection_id))) {
    throw new Error('A published hymn references a non-public collection.')
  }

  const { error: collectionUpsertError } = await staging
    .from('hymnal_collections')
    .upsert(collections, { onConflict: 'id' })
  if (collectionUpsertError) throw collectionUpsertError

  const writableHymns = hymns.map(({ search_text: _generatedSearchText, ...hymn }) => hymn)

  for (let index = 0; index < writableHymns.length; index += BATCH_SIZE) {
    const { error } = await staging
      .from('hymns')
      .upsert(writableHymns.slice(index, index + BATCH_SIZE), {
        onConflict: 'id',
      })
    if (error) throw error
  }

  const [stagingHymns, corariosAfter] = await Promise.all([
    staging
      .from('hymns')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .eq('is_published', true),
    staging.from('corarios').select('id', { count: 'exact', head: true }),
  ])
  if (stagingHymns.error) throw stagingHymns.error
  if (corariosAfter.error) throw corariosAfter.error
  if (stagingHymns.count !== hymns.length) {
    throw new Error(
      `Count mismatch: production=${hymns.length}, staging=${stagingHymns.count}`,
    )
  }
  if (corariosAfter.count !== corariosBefore.count) {
    throw new Error('Safety check failed: staging corarios count changed.')
  }

  console.log(
    JSON.stringify(
      {
        productionRef,
        stagingRef,
        collections: collections.length,
        publishedHymns: hymns.length,
        stagingCorarios: corariosAfter.count,
      },
      null,
      2,
    ),
  )
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
