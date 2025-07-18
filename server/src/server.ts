import app from './index';

// Railway injects this, or use 3001 for local dev
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
