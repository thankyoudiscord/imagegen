module.exports = {
  ...require('gts/.prettierrc.json'),
  importOrder: ['<THIRD_PARTY_MODULES>', 'imagegen', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
