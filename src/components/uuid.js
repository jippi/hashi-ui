function shortUUID(ID) {
	let re = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
	if (ID.match(re)) {
		return ID.substring(0, 8)
	} else {
		return ID
	}
}

export default shortUUID
