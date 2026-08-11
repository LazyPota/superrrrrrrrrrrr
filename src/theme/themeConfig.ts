const theme = {
  token: {
    fontSize: 14,
    colorPrimary: '#0052cc',
    colorLink: '#0052cc',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#06b6d4',
    colorBgBase: '#ffffff',
    colorTextBase: '#0f172a',
    borderRadius: 12,
    fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    boxShadowSecondary: '0 10px 30px -5px rgba(0, 51, 153, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03)',
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 42,
      fontWeight: 600,
      colorBgContainer: '#ffffff',
      primaryShadow: '0 4px 14px 0 rgba(0, 82, 204, 0.35)',
    },
    Card: {
      borderRadiusLG: 16,
      boxShadowSecondary: '0 4px 20px rgba(0, 0, 0, 0.04)',
    },
    Input: {
      controlHeight: 44,
      borderRadius: 10,
      colorBorder: '#e2e8f0',
      activeBorderColor: '#0052cc',
      hoverBorderColor: '#3b82f6',
    },
    Select: {
      controlHeight: 44,
      borderRadius: 10,
    },
    Modal: {
      borderRadiusLG: 20,
      contentBg: '#ffffff',
    },
    Tag: {
      borderRadius: 6,
      fontSize: 12,
    },
    Tabs: {
      itemSelectedColor: '#0052cc',
      inkBarColor: '#0052cc',
      titleFontSize: 15,
      fontWeightStrong: 700,
    },
    Badge: {
      fontSize: 11,
    },
  },
};

export default theme;
