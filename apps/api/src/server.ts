import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`[CampusShelf API] Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
});
