-- ============================================================
-- ENUMS
-- ============================================================

do $$ begin
  create type user_gender as enum ('male', 'female', 'other');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_role as enum ('admin', 'user');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_lock_type as enum ('none', '15_days', '30_days', 'permanent');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type conversation_status as enum ('active', 'ended', 'blocked');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type report_status as enum ('pending', 'approved', 'rejected');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type subscription_plan_type as enum ('vip', 'premium');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type user_subscription_status as enum ('active', 'expired', 'cancelled');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type payment_status as enum ('pending', 'completed', 'failed', 'refunded');
exception when duplicate_object then null;
end $$;

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists users (
    id              uuid            primary key default gen_random_uuid(),
    email           varchar         not null,
    google_id       varchar         unique,
    password_hash   varchar,
    full_name       varchar,
    avatar_url      text,
    badge           text,
    date_of_birth   date,
    phone_number    varchar,
    bio             text,
    gender          user_gender,
    city            varchar,
    role            user_role       not null default 'user',
    is_active       boolean         not null default true,
    lock_type       user_lock_type  not null default 'none',
    locked_until    timestamptz,
    lock_reason     text,
    locked_by_report_id varchar,
    created_at      timestamptz     not null default now(),
    updated_at      timestamptz     not null default now()
);

create unique index if not exists users_email_key on users (email);

create table if not exists match_queue (
    id                uuid        primary key default gen_random_uuid(),
    user_id           uuid        not null,
    gender_preference varchar,
    city_preference   varchar,
    status            varchar     not null default 'waiting',
    priority_score    int         not null default 0,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

create table if not exists conversations (
    id         uuid                primary key default gen_random_uuid(),
    user_id    uuid                not null,
    partner_id uuid                not null,
    status     conversation_status not null default 'active',
    metadata   jsonb               not null default '{}'::jsonb,
    created_at timestamptz         not null default now(),
    updated_at timestamptz         not null default now()
);

create table if not exists messages (
    id              uuid        primary key default gen_random_uuid(),
    conversation_id uuid        not null,
    sender_id       uuid        not null,
    content         text        not null,
    type            varchar     not null default 'text',
    created_at      timestamptz not null default now()
);

create table if not exists reports (
    id              uuid          primary key default gen_random_uuid(),
    reporter_id     uuid          not null,
    reported_id     uuid          not null,
    conversation_id uuid,
    title           varchar,
    description     text,
    status          report_status not null default 'pending',
    action          varchar,
    processed_by_id uuid,
    processed_at    timestamptz,
    created_at      timestamptz   not null default now(),
    updated_at      timestamptz   not null default now()
);

create table if not exists conduct_rules (
    id         uuid        primary key default gen_random_uuid(),
    content    text        not null,
    note       text,
    is_active  boolean     not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists page_visits (
    id         uuid        primary key default gen_random_uuid(),
    user_id    uuid,
    page       varchar     not null,
    referrer   text,
    user_agent text,
    ip_address varchar,
    visited_at timestamptz not null default now()
);

create table if not exists outbox_events (
    id           uuid        primary key default gen_random_uuid(),
    type         varchar     not null,
    payload      jsonb       not null,
    status       varchar     not null default 'pending',
    created_at   timestamptz not null default now(),
    processed_at timestamptz
);

create table if not exists subscription_plans (
    id                  uuid                  primary key default gen_random_uuid(),
    type                subscription_plan_type not null,
    name                varchar(100)           not null,
    description         text,
    price               decimal(12,2)          not null default 0,
    duration_days       int                    not null default 30,
    features            jsonb                  not null default '[]'::jsonb,
    match_priority_seconds int                 not null default 60,
    is_active           boolean                not null default true,
    created_at          timestamptz            not null default now(),
    updated_at          timestamptz            not null default now()
);

create table if not exists user_subscriptions (
    id         uuid                     primary key default gen_random_uuid(),
    user_id    uuid                     not null,
    plan_id    uuid                     not null,
    status     user_subscription_status not null default 'active',
    start_date timestamptz              not null,
    end_date   timestamptz              not null,
    auto_renew boolean                  not null default false,
    created_at timestamptz              not null default now(),
    updated_at timestamptz              not null default now()
);

create table if not exists payments (
    id             uuid           primary key default gen_random_uuid(),
    user_id        uuid           not null,
    amount         decimal(12,2)  not null,
    payment_method varchar,
    description    text,
    status         payment_status not null default 'pending',
    created_at     timestamptz    not null default now(),
    updated_at     timestamptz    not null default now()
);

create table if not exists ads (
    id           uuid        primary key default gen_random_uuid(),
    name         varchar(200) not null,
    type         varchar     not null default 'banner',
    image_url    text,
    link_url     text,
    is_active    boolean     not null default true,
    impressions  int         not null default 0,
    clicks       int         not null default 0,
    start_date   timestamptz,
    end_date     timestamptz,
    created_at   timestamptz not null default now(),
    updated_at   timestamptz not null default now()
);

create table if not exists ad_stats (
    id         uuid        primary key default gen_random_uuid(),
    ad_id      uuid        not null,
    type       varchar     not null,
    user_id    uuid,
    ip_address varchar,
    created_at timestamptz not null default now()
);

-- ============================================================
-- FOREIGN KEYS
-- ============================================================

alter table match_queue drop constraint if exists fk_match_queue_user;
alter table match_queue
    add constraint fk_match_queue_user
    foreign key (user_id) references users (id);

alter table conversations drop constraint if exists fk_conversations_user;
alter table conversations
    add constraint fk_conversations_user
    foreign key (user_id) references users (id);

alter table conversations drop constraint if exists fk_conversations_partner;
alter table conversations
    add constraint fk_conversations_partner
    foreign key (partner_id) references users (id);

alter table messages drop constraint if exists fk_messages_conversation;
alter table messages
    add constraint fk_messages_conversation
    foreign key (conversation_id) references conversations (id);

alter table messages drop constraint if exists fk_messages_sender;
alter table messages
    add constraint fk_messages_sender
    foreign key (sender_id) references users (id);

alter table reports drop constraint if exists fk_reports_reporter;
alter table reports
    add constraint fk_reports_reporter
    foreign key (reporter_id) references users (id);

alter table reports drop constraint if exists fk_reports_reported;
alter table reports
    add constraint fk_reports_reported
    foreign key (reported_id) references users (id);

alter table reports drop constraint if exists fk_reports_conversation;
alter table reports
    add constraint fk_reports_conversation
    foreign key (conversation_id) references conversations (id);

alter table reports drop constraint if exists fk_reports_processed_by;
alter table reports
    add constraint fk_reports_processed_by
    foreign key (processed_by_id) references users (id);

alter table page_visits drop constraint if exists fk_page_visits_user;
alter table page_visits
    add constraint fk_page_visits_user
    foreign key (user_id) references users (id);

alter table user_subscriptions drop constraint if exists fk_user_subscriptions_user;
alter table user_subscriptions
    add constraint fk_user_subscriptions_user
    foreign key (user_id) references users (id);

alter table user_subscriptions drop constraint if exists fk_user_subscriptions_plan;
alter table user_subscriptions
    add constraint fk_user_subscriptions_plan
    foreign key (plan_id) references subscription_plans (id);

alter table payments drop constraint if exists fk_payments_user;
alter table payments
    add constraint fk_payments_user
    foreign key (user_id) references users (id);

alter table ad_stats drop constraint if exists fk_ad_stats_ad;
alter table ad_stats
    add constraint fk_ad_stats_ad
    foreign key (ad_id) references ads (id);

-- ============================================================
-- INDEXES
-- ============================================================

-- users indexes
create index if not exists idx_users_city_gender_active
    on users (city, gender, is_active);
create index if not exists idx_users_role_created_id
    on users (role, created_at, id);
create index if not exists idx_users_active_created_id
    on users (is_active, created_at, id);
create index if not exists idx_users_active_lock_created_id
    on users (is_active, lock_type, created_at, id);
create index if not exists idx_users_created_id
    on users (created_at, id);
create index if not exists idx_users_lock_created_id
    on users (lock_type, created_at, id);
create index if not exists idx_users_lock_locked_until
    on users (lock_type, locked_until);

-- match_queue indexes
create index if not exists idx_match_queue_status_created
    on match_queue (status, created_at);
create index if not exists idx_match_queue_user
    on match_queue (user_id);

-- conversations indexes
create index if not exists idx_conversations_user_created
    on conversations (user_id, created_at desc);
create index if not exists idx_conversations_partner_created
    on conversations (partner_id, created_at desc);
create index if not exists idx_conversations_status
    on conversations (status);

-- messages indexes
create index if not exists idx_messages_conversation_created
    on messages (conversation_id, created_at desc);
create index if not exists idx_messages_sender
    on messages (sender_id);

-- reports indexes
create index if not exists idx_reports_status_created
    on reports (status, created_at desc);
create index if not exists idx_reports_reporter
    on reports (reporter_id);
create index if not exists idx_reports_reported
    on reports (reported_id);

-- page_visits indexes
create index if not exists idx_page_visits_visited_at
    on page_visits (visited_at);

-- user_subscriptions indexes
create index if not exists idx_user_subscriptions_user_status
    on user_subscriptions (user_id, status);

-- payments indexes
create index if not exists idx_payments_user_created
    on payments (user_id, created_at desc);
create index if not exists idx_payments_status
    on payments (status);

-- ad_stats indexes
create index if not exists idx_ad_stats_ad_created
    on ad_stats (ad_id, created_at);
create index if not exists idx_ad_stats_created
    on ad_stats (created_at);

-- ============================================================
-- SPEED BOOSTS (collective speed-up mechanic)
-- ============================================================

create table if not exists speed_boosts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id) on delete cascade,
    ad_viewed_at timestamptz,
    boost_expires_at timestamptz,
    cooldown_until timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_speed_boost_user
    on speed_boosts (user_id);
create index if not exists idx_speed_boost_expires
    on speed_boosts (boost_expires_at);
