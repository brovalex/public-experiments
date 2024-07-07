# Notes

```
npx create-next-app@latest
cd receipts-app
npm run dev

npm install sqlite3
npm install prisma --save-dev
npx prisma init --datasource-provider sqlite
touch prisma/dev.db

# added fields in schema
npx prisma db push
# npx prisma studio # to view


```