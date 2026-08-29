import app from './app';
import env from './config/env';

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
  console.log(`📚 API: http://localhost:${env.PORT}/api/v1`);
  console.log(`❤️  Health: http://localhost:${env.PORT}/api/health`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
});
