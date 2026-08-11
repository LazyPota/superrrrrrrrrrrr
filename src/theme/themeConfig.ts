const theme = {
  token: {
    fontSize: 14,
    colorPrimary: '#ffe600',
    colorLink: '#ff2a85',
    colorSuccess: '#00e676',
    colorWarning: '#ff6b00',
    colorError: '#ff2a85',
    colorInfo: '#00f0ff',
    colorBgBase: '#faf9f6',
    colorTextBase: '#000000',
    colorBorder: '#000000',
    borderRadius: 12,
    fontFamily: '"Plus Jakarta Sans", "Syne", "Outfit", sans-serif',
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 44,
      fontWeight: 800,
      colorBorder: '#000000',
      colorBgContainer: '#ffe600',
      colorText: '#000000',
    },
    Card: {
      borderRadiusLG: 16,
      colorBorderSecondary: '#000000',
    },
    Input: {
      controlHeight: 44,
      borderRadius: 12,
      colorBorder: '#000000',
    },
    Select: {
      controlHeight: 44,
      borderRadius: 12,
    },
    Modal: {
      borderRadiusLG: 20,
      contentBg: '#ffffff',
    },
    Tag: {
      borderRadius: 8,
      fontSize: 12,
      fontWeight: 800,
    },
    Tabs: {
      itemSelectedColor: '#000000',
      inkBarColor: '#000000',
      titleFontSize: 15,
      fontWeightStrong: 800,
    },
  },
};

export default theme;
