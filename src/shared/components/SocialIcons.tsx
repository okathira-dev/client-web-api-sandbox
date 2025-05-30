import { Box, IconButton, SvgIcon } from "@mui/material";

type SocialIconsProps = {
  githubURL: string;
};

export function SocialIcons({ githubURL }: SocialIconsProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "16px",
        right: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      {/* 目次アイコン */}
      <IconButton
        component="a"
        href="../index.html"
        aria-label="目次ページへ戻る"
        sx={{ padding: 0, width: "24px", height: "24px", minWidth: "24px" }}
      >
        <SvgIcon sx={{ fontSize: "24px" }} viewBox="0 0 24 24">
          <path d="M12 2.1L1 12h3v9h7v-6h2v6h7v-9h3L12 2.1zm0 2.691l6 5.4V19h-3v-6H9v6H6v-8.809l6-5.4z" />
        </SvgIcon>
      </IconButton>

      {/* GitHub */}
      <IconButton
        component="a"
        href={githubURL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub repository"
        sx={{ padding: 0, width: "24px", height: "24px", minWidth: "24px" }}
      >
        <SvgIcon sx={{ fontSize: "24px" }} viewBox="0 0 16 16">
          <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
        </SvgIcon>
      </IconButton>

      {/* X (Twitter) */}
      <IconButton
        component="a"
        href="https://x.com/okathira"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X (Twitter)"
        sx={{ padding: 0, width: "24px", height: "24px", minWidth: "24px" }}
      >
        <SvgIcon sx={{ fontSize: "24px" }} viewBox="0 0 24 24">
          <path d="M13.3174 10.7749L19.1457 4H17.7646L12.7039 9.88256L8.66193 4H4L10.1566 12.6267L4 19.7778H5.38119L10.7696 13.5191L15.0678 19.7778H19.7297M6.12966 5.12554H8.00722L17.5747 18.6526H15.697" />
        </SvgIcon>
      </IconButton>

      {/* Bluesky */}
      <IconButton
        component="a"
        href="https://bsky.app/profile/okathira.bsky.social"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Bluesky"
        sx={{ padding: 0, width: "24px", height: "24px", minWidth: "24px" }}
      >
        <SvgIcon sx={{ fontSize: "24px" }} viewBox="0 0 24 24">
          <path d="M12 9.464c-1.086-2.114-4.046-6.052-6.797-8.028C3.233-0.39 2.228-0.069 1.568 0.23A2.21 2.21 0 0 0 0 2.434c0 .689.378 5.647.624 6.485 1.477 2.736 3.91 3.661 6.374 3.364.137-.02.275-.039.415-.057-.137.022-.276.041-.415.057-3.907.58-7.38 2.005-2.83 7.088 5.015 5.19 6.872-1.114 7.824-4.308.952 3.194 2.049 9.271 7.733 4.308 4.267-4.308 1.17-6.497-2.74-7.087-.139-.016-.277-.035-.414-.057.14.018.278.037.414.057 2.67.297 5.102-.628 6.58-3.365.246-.838.624-5.796.624-6.485 0-.689-.139-1.84-.89-2.204-.66-.299-1.665-.62-3.527.23-2.751 1.976-5.711 5.914-6.797 8.028z" />
        </SvgIcon>
      </IconButton>
    </Box>
  );
}
