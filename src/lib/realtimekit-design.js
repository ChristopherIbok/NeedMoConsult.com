import { provideRtkDesignSystem, extendConfig } from "@cloudflare/realtimekit-react-ui";

export const zoomTokens = {
  colors: {
    primary: "#D4AF7A",
    primaryHover: "#C49A5E",
    secondary: "#D4AF7A",
    secondaryHover: "#C49A5E",
    accent: "#D4AF7A",
    accentHover: "#C49A5E",
    background: "#1A2332",
    backgroundHover: "#252F42",
    surface: "#2D3748",
    surfaceHover: "#3A4A5E",
    text: "#FFFFFF",
    textSecondary: "#A0AEC0",
    textMuted: "#718096",
    border: "#4A5568",
    borderHover: "#D4AF7A",
    success: "#48BB78",
    warning: "#ECC94B",
    error: "#F56565",
    info: "#4299E1",
  },
  spacing: {
    base: 4,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    "2xl": 32,
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    full: "9999px",
  },
  fontSizes: {
    xs: "11px",
    sm: "12px",
    md: "14px",
    lg: "16px",
    xl: "18px",
    "2xl": "24px",
  },
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const customDesignSystem = provideRtkDesignSystem(zoomTokens);

export const extendedConfig = extendConfig({
  components: {
    meeting: {
      background: "#1A2332",
      toolbarBackground: "rgba(26, 35, 50, 0.95)",
      toolbarHeight: "60px",
      borderRadius: "12px",
      participantBorderRadius: "8px",
    },
    button: {
      primaryBackground: "#D4AF7A",
      primaryColor: "#1A2332",
      primaryHoverBackground: "#C49A5E",
      secondaryBackground: "transparent",
      secondaryColor: "#FFFFFF",
      secondaryBorder: "1px solid #4A5568",
      dangerBackground: "#F56565",
      dangerColor: "#FFFFFF",
    },
    icon: {
      size: "20px",
      strokeWidth: 1.5,
    },
    toolbar: {
      gap: "4px",
      buttonGap: "4px",
      buttonPadding: "8px 12px",
      iconSize: "20px",
    },
    participant: {
      nameFontSize: "12px",
      nameColor: "#FFFFFF",
      micIconSize: "14px",
      speakingBorderColor: "#D4AF7A",
      speakingBorderWidth: "2px",
    },
  },
});

export default customDesignSystem;
