FROM git.skill17.com/images/node

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 80
CMD [ "http-server", "dist", "-p", "80", "-P", "http://localhost:80?" ]

