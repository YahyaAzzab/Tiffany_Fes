# Tiffany Fès

Boutique en ligne de Tiffany, confiserie du boulevard Moulay Hicham à Fès. Les clients commandent, la boutique confirme, le paiement se fait au retrait ou à la livraison.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrez http://localhost:3000

Espace boutique : http://localhost:3000/admin/login

Tant que Supabase n'est pas rempli, la connexion est celle du fichier `.env` (`DEMO_ADMIN_EMAIL` et `DEMO_ADMIN_PASSWORD`). Les produits vivent dans `data/catalog.json`, les commandes dans `data/orders.json`.

## Brancher Supabase

1. Créez un projet sur [supabase.com](https://supabase.com).
2. SQL Editor : collez et exécutez `supabase/schema.sql`.
3. Authentication → Users → Add user : un e-mail et un mot de passe pour la boutique.
4. Project Settings → API : copiez l'URL du projet et la clé `anon` `public`.
5. Déposez-les dans `.env` :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

6. Relancez `npm run dev`, connectez-vous avec le compte Supabase, puis sur le tableau de bord cliquez sur **Importer le catalogue** si la base est vide.
7. Avant la mise en ligne, mettez `NEXT_PUBLIC_SITE_URL` sur le vrai domaine. Ajoutez le téléphone dans `NEXT_PUBLIC_PHONE` et `NEXT_PUBLIC_WHATSAPP` (chiffres, indicatif 212) pour afficher l'appel et WhatsApp.

Les photos déjà dans le projet restent servies par le site. Les nouvelles photos partent dans le bucket `product-images`.

## Ce que la boutique peut faire

- Créer un produit avec plusieurs photos, un texte alternatif, l'ordre, et le cadrage (affiche entière ou photo pleine).
- Choisir un rayon, des parfums, un stock, un prix, un badge, une mise en avant.
- Masquer un produit, ou le passer en « sur devis » (coffrets).
- Suivre les commandes : nouvelle, confirmée, en préparation, livrée, annulée.
- Lire les messages du formulaire de contact.

## Prix déjà posés

Ils viennent des affiches publiques de Tiffany : Swirl 25 DH, Choco Rice 16 DH, Maxi Dough 36 DH, Choco Missu 20 DH. Le coffret d'anniversaire est sur devis. Le tiramisu est enregistré mais masqué : ajoutez les photos et le prix, puis publiez-le.

## Mise en ligne

Le projet se déploie sur Vercel (ou un Node qui lance `npm run build` puis `npm start`). En production, Supabase est nécessaire : le disque d'un hébergeur ne garde pas les commandes. Changez aussi le mot de passe démo, même s'il ne sert plus une fois Supabase actif.
