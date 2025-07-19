import app from './index';

const PORT = Number(process.env.PORT || '3001'); // Ensure it's a number

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
});
