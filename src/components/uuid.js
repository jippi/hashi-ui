function shortUUID(ID) {
	let re = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	if (ID.match(re)) {
		return ID.substring(0, 8)
	} else {
		return ID
	}
}

module.exports = {
	shortUUID: shortUUID
};
