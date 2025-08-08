import { exec } from 'child_process';

export default function handler(req, res) {
  const { url } = req.query;

  if (!url || !url.includes('youtube.com')) {
    return res.status(400).send('Thiếu hoặc sai URL YouTube');
  }

  exec(`yt-dlp -g ${url}`, (error, stdout, stderr) => {
    if (error || !stdout) {
      console.error("Lỗi yt-dlp:", stderr || error.message);
      return res.status(500).send("Không lấy được m3u8");
    }

    const [videoUrl] = stdout.trim().split('\n');
    if (!videoUrl || !videoUrl.includes('.m3u8')) {
      return res.status(404).send("Không tìm thấy luồng m3u8");
    }

    // Redirect vĩnh viễn hoặc tạm thời (302)
    res.writeHead(302, { Location: videoUrl });
    res.end();
  });
}