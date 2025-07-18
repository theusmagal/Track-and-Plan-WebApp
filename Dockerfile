FROM node:18

WORKDIR /app

COPY . .

WORKDIR /app/server

RUN npm install
RUN npm run build
RUN npx prisma generate
RUN npx prisma db push

CMD ["npm", "start"]
