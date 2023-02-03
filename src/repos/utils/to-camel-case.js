module.exports = (rows) => {
  return rows.map((row) => {
    const replaced = {};

    for (let key in row) {
      // find - or _ followed by a-z then change to upper case
      const camelCase = key.replace(/([-_][a-z])/gi, ($1) =>
        $1.toUpperCase().replace('_', '')
      );

      replaced[camelCase] = row[key];
    }

    return replaced;
  });
};
