// https://github.com/chriso/validator.js/blob/master/src/lib/isUUID.js
const uuid = {
  3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
  4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
  all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
}

function isUUID(str, version = "all") {
  if (str.length != 36) {
    return false
  }

  const pattern = uuid[version]
  return pattern && pattern.test(str)
}

function shortUUID(ID) {
  return isUUID(ID) ? ID.substring(0, 8) : ID
}

export default shortUUID
