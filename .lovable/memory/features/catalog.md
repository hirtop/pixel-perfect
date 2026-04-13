---
name: Internal product catalog
description: catalog_products table (curated bathroom products V1) + project_saved_products (user saves/AI recs linked to projects)
type: feature
---
- `catalog_products` — internal curated catalog, admin-managed via service_role
  - V1 categories: Vanity, Mirror, Faucet, Light (room_type='bathroom')
  - Fields: category, room_type, title, brand, price, finish, style_tags[], width/depth/height, image_url, product_url, short_description, install_notes, compatibility_tags[], active
  - GIN indexes on style_tags and compatibility_tags
  - RLS: authenticated can SELECT; service_role can ALL
- `project_saved_products` — links catalog products to user projects
  - Fields: project_id (FK projects), product_id (FK catalog_products), category, source ('manual'|'ai_recommended'), notes
  - Unique constraint on (project_id, product_id)
  - RLS: users can CRUD only on their own projects (checked via projects.user_id)
- Expandable: room_type supports kitchen/laundry later; categories unconstrained text
- Deferred: admin UI, AI recommendation engine, chat UI, external retailer feeds
