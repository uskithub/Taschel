const clone = items => {
  return JSON.parse(JSON.stringify(items));
};

const validateUserRules = (name, validation) => {
  return validation
    .filter(val => {
      if (typeof val.rule === 'string') return !new RegExp(val.rule).test(name);
      if (val.rule instanceof RegExp) return !val.rule.test(name);
      const isFunction = {}.toString.call(val.rule) === '[object Function]';
      if (isFunction) return val.rule(name);
    })
    .map(val => val.type);
};

const createClasses = (name, tags, validation, checkFromInside) => {
  if (!validation) validation = [];
  if (checkFromInside === undefined) checkFromInside = true;
  const classes = validateUserRules(name, validation);
  if (checkFromInside) {
    if (tags.filter(t => t.name === name).length > 1) classes.push('duplicate');
  } else {
    if (tags.map(t => t.name).indexOf(name) !== -1) classes.push('duplicate');
  }
  classes.length === 0 ? classes.push('valid') : classes.push('invalid');
  return classes;
};

const createTag = (tag, tags, validation, checkFromInside) => {
  if (tag.name === undefined) tag = { name: tag };
  const t = clone(tag);
  t.tiClasses = createClasses(t.name, tags, validation, checkFromInside);
  return t;
};

const createTags = (tags, autocompleteItems, validation, checkFromInside) => {
  return tags.map(t => createTag(t, autocompleteItems, validation, checkFromInside));
};

export {
  createClasses,
  createTag,
  createTags,
};
