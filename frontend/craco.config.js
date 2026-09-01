module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Suppress 'Failed to parse source map' warnings from html5-qrcode
      // and any other node_modules that ship broken source maps.
      webpackConfig.ignoreWarnings = [
        { message: /Failed to parse source map/ },
      ];
      return webpackConfig;
    },
  },
};
