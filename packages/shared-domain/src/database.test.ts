import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildOrganizationSongOwner,
  buildPersonalSongOwner,
  isOrganizationSong,
  isPersonalSong,
} from './database'

const migration = (name: string) =>
  readFileSync(resolve(process.cwd(), 'supabase', 'migrations', name), 'utf8').toLowerCase()

describe('repertoire ownership contracts', () => {
  it('builds mutually exclusive personal and organization ownership', () => {
    const personal = buildPersonalSongOwner('user-a')
    const ministry = buildOrganizationSongOwner('org-a')

    expect(personal).toEqual({ owner_user_id: 'user-a', organization_id: null })
    expect(ministry).toEqual({ owner_user_id: null, organization_id: 'org-a' })
    expect(isPersonalSong(personal)).toBe(true)
    expect(isOrganizationSong(personal)).toBe(false)
    expect(isOrganizationSong(ministry)).toBe(true)
    expect(isPersonalSong(ministry)).toBe(false)
  })
})

describe('monetization MVP migrations', () => {
  it('defines the required schema and exclusive song owner constraint', () => {
    const sql = migration('202607200001_monetization_mvp_schema.sql')

    for (const table of [
      'user_entitlements',
      'organizations',
      'organization_members',
      'organization_invitations',
      'services',
      'service_assignments',
      'songs',
      'service_songs',
      'affiliate_partners',
      'affiliate_courses',
      'affiliate_clicks',
      'sponsor_campaigns',
      'sponsor_placements',
      'sponsor_events',
    ]) {
      expect(sql).toContain(`create table if not exists public.${table}`)
    }

    expect(sql).toContain('songs_exactly_one_owner')
    expect(sql).toContain("(owner_user_id is not null)::integer + (organization_id is not null)::integer = 1")
    expect(sql).toContain('unique (id, organization_id)')
    expect(sql).toContain('foreign key (song_id, organization_id)')
    expect(sql).toContain('references public.songs (id, organization_id)')
  })

  it('defines entitlement, membership, limit, invitation, and tracking functions', () => {
    const sql = migration('202607200002_monetization_mvp_functions.sql')

    for (const fn of [
      'resolve_effective_entitlement',
      'is_organization_member',
      'has_organization_role',
      'enforce_personal_song_limit',
      'enforce_organization_owner_limit',
      'enforce_organization_member_limit',
      'enforce_active_service_limit',
      'protect_organization_billing_fields',
      'accept_organization_invitation',
      'record_affiliate_click',
      'record_sponsor_event',
    ]) {
      expect(sql).toContain(`function public.${fn}`)
    }

    expect(sql).toContain("personal_song_limit := -1")
    expect(sql).toContain("raise exception using errcode = 'p0001', message = 'personal_song_limit_reached'")
    expect(sql).toContain("message = 'organization_limit_reached'")
    expect(sql).toContain("message = 'organization_plan_is_server_managed'")
  })

  it('enables RLS and declares private and organization song policies', () => {
    const sql = migration('202607200003_monetization_mvp_rls.sql')

    for (const table of [
      'user_entitlements',
      'organizations',
      'organization_members',
      'organization_invitations',
      'services',
      'service_assignments',
      'songs',
      'service_songs',
      'affiliate_partners',
      'affiliate_courses',
      'affiliate_clicks',
      'sponsor_campaigns',
      'sponsor_placements',
      'sponsor_events',
    ]) {
      expect(sql).toContain(`alter table public.${table} enable row level security`)
    }

    expect(sql).toContain('songs_select_personal_owner')
    expect(sql).toContain('songs_select_organization_members')
    expect(sql).toContain('songs_write_personal_owner')
    expect(sql).toContain('songs_write_organization_leaders')
    expect(sql).toContain('auth.uid() = owner_user_id')
    expect(sql).toContain('public.is_organization_member(organization_id)')
  })

  it('contains executable isolation and plan-limit assertions', () => {
    const sql = readFileSync(
      resolve(process.cwd(), 'supabase', 'tests', 'monetization_mvp_rls.sql'),
      'utf8',
    ).toLowerCase()

    expect(sql).toContain('user a cannot read user b private songs')
    expect(sql).toContain('authorized members can read organization songs')
    expect(sql).toContain('free personal song limit')
    expect(sql).toContain('pro personal songs are unlimited')
    expect(sql).toContain('ministry access is scoped by organization')
    expect(sql).toContain('rollback')
  })

  it('processes RevenueCat events idempotently and server-side only', () => {
    const sql = migration('202607200008_revenuecat_billing.sql')

    expect(sql).toContain('create table if not exists public.billing_events')
    expect(sql).toContain('external_event_id text not null unique')
    expect(sql).toContain('function public.process_revenuecat_event')
    expect(sql).toContain("auth.role() <> 'service_role'")
    expect(sql).toContain('on conflict (external_event_id) do nothing')
    expect(sql).toContain('grant execute on function public.process_revenuecat_event')
    expect(sql).toContain('to service_role')
  })
})
