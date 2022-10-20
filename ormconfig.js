module.exports = [{
   type: process.env.DB_TYPE,
   host: process.env.DB_HOST,
   port: Number(process.env.DB_PORT),
   username: process.env.DB_USERNAME,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE,
   timezone: '+0',
   synchronize: false,
   logging: false,
   entities: [
      'dist/**/*.entity.js'
   ],
   migrations: [
      'dist/migrations/**/*.js'
   ],
   subscribers: [
      'dist/subscriber/**/*.js'
   ],
   cli: {
      migrationsDir: 'src/migration',
      subscribersDir: 'src/subscriber',
   },
}];
