// const fs = require('fs')
const { nanoid } = require("nanoid");
const books = require("./books"); //local file

/*
// mengecek keberadaan folder data
const dirPath = './data'
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath)
}

// mengecek keberadaan file contacts.json
const dataPath = './data/books.json'
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, '[]', 'utf-8')
}

const loadBooks = () => {
  const fileBuffer = fs.readFileSync('data/books.json', 'utf-8')
  const books = JSON.parse(fileBuffer) //ubah String ke JSON

  return books
}
*/

const isFinished = (pageCount, readPage) => {
	if (pageCount === readPage) {
		return true;
	}
	return false;
};

// OPTIONAL
const findBooksByName = (names, h) => {
	// const books = loadBooks()
	//tampung hasilnya
	const result = books.filter(book =>
		book.name.toLowerCase().match(names.toLowerCase())
	);
	if (result !== undefined) {
		const response = h.response({
			status: "success",
			data: {
				books: result.map(({ id, name, publisher }) => ({
					id,
					name,
					publisher
				}))
			}
		});
		response.code(200);
		return response;
	}
	const response = h.response({
		status: "success",
		data: {
			books: []
		}
	});
	response.code(200);
	return response;
};

const getReadingList = (reading, h) => {
	// const books = loadBooks()
	//tampung list buku
	const result = books.filter(book => book.reading == reading);
	const response = h.response({
		status: "success",
		data: {
			books: result.map(({ id, name, publisher }) => ({ id, name, publisher }))
		}
	});
	response.code(200);
	return response;
};

const getFinishedList = (finished, h) => {
	// const books = loadBooks()
	//tampung list buku
	const result = books.filter(book => book.finished == finished);
	const response = h.response({
		status: "success",
		data: {
			books: result.map(({ id, name, publisher }) => ({ id, name, publisher }))
		}
	});
	response.code(200);
	return response;
};

// MANDATORY
const addBooksHandler = (request, h) => {
	// get books.json
	// const books = loadBooks()

	// get info to add from post data
	// equeal to JSON.parse()
	const {
		name,
		year,
		author,
		summary,
		publisher,
		pageCount,
		readPage,
		reading
	} = request.payload;

	// Make id 16 digits
	const id = nanoid(16);

	// today's date
	const insertedAt = new Date().toISOString();
	const updatedAt = insertedAt; // karena ini add method maka val sama
	const finished = isFinished(pageCount, readPage);

	// check if client sent name
	if (typeof name === "undefined" || name == "") {
		const response = h.response({
			status: "fail",
			message: "Gagal menambahkan buku. Mohon isi nama buku"
		});
		response.code(400);
		return response;
	}

	// check pageCount & readPage
	if (pageCount < readPage) {
		const response = h.response({
			status: "fail",
			message:
				"Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount"
		});
		response.code(400);
		return response;
	}

	const newBook = {
		id,
		name,
		year,
		author,
		summary,
		publisher,
		pageCount,
		readPage,
		finished,
		reading,
		insertedAt,
		updatedAt
	};

	// push newBook to books (yg berisi array)
	books.push(newBook);

	const isSuccess = books.filter(book => book.id === id).length > 0;

	// jika success maka beri kode berhasil
	if (isSuccess) {
		// rewrite books.json file
		// stringify = convert JSON to string
		//fs.writeFileSync('data/books.json', JSON.stringify(books))

		const response = h.response({
			status: "success",
			message: "Buku berhasil ditambahkan",
			data: {
				bookId: id
			}
		});
		response.code(201);
		return response;
	}

	const response = h.response({
		status: "error",
		message: "Buku gagal ditambahkan"
	});
	response.code(500);
	return response;
};

const getAllBooksHandler = (request, h) => {
	if (request.query != null) {
		let { name, reading, finished } = request.query;
		if (name != null) return findBooksByName(name, h);
		if (reading != null) return getReadingList(reading, h);
		if (finished != null) return getFinishedList(finished, h);
	}
	const response = h.response({
		status: "success",
		data: {
			books: books.map(({ id, name, publisher }) => ({ id, name, publisher }))
		}
	});
	response.code(200);
	return response;
};

const getBookByIdHandler = (request, h) => {
	//get id from url
	const { bookId } = request.params;
	// const books = loadBooks()

	//tampung id yang udah terambil
	const book = books.filter(n => n.id === bookId)[0];

	if (book !== undefined) {
		const response = h.response({
			status: "success",
			data: {
				book
			}
		});
		response.code(200);
		return response;
	}
	const response = h.response({
		status: "fail",
		message: "Buku tidak ditemukan"
	});
	response.code(404);
	return response;
};

const editBookByIdHandler = (request, h) => {
	const { bookId } = request.params;
	// const books = loadBooks()

	const index = books.findIndex(book => book.id === bookId);

	const {
		name,
		year,
		author,
		summary,
		publisher,
		pageCount,
		readPage,
		reading
	} = request.payload;
	const updatedAt = new Date().toISOString();

	// check client send name
	if (typeof name === "undefined" || name == "") {
		const response = h.response({
			status: "fail",
			message: "Gagal memperbarui buku. Mohon isi nama buku"
		});
		response.code(400);
		return response;
	}

	// check pageCount & readPage
	if (pageCount < readPage) {
		const response = h.response({
			status: "fail",
			message:
				"Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount"
		});
		response.code(400);
		return response;
	}

	if (index !== -1) {
		books[index] = {
			...books[index],
			name,
			year,
			author,
			summary,
			publisher,
			pageCount,
			readPage,
			reading,
			updatedAt
		};

		//fs.writeFileSync('data/books.json', JSON.stringify(books))

		const response = h.response({
			status: "success",
			message: "Buku berhasil diperbarui"
		});
		response.code(200);
		return response;
	}

	const response = h.response({
		status: "fail",
		message: "Gagal memperbarui buku. Id tidak ditemukan"
	});
	response.code(404);
	return response;
};

const deleteBookByIdHandler = (request, h) => {
	const { bookId } = request.params;
	// const books = loadBooks()

	//tampung id yang udah terambil
	const index = books.findIndex(book => book.id === bookId);

	if (index !== -1) {
		//method splice(position,howmanyremove,itemtoadd)
		books.splice(index, 1);
		//fs.writeFileSync('data/books.json', JSON.stringify(books))
		const response = h.response({
			status: "success",
			message: "Buku berhasil dihapus"
		});
		response.code(200);
		return response;
	}
	const response = h.response({
		status: "fail",
		message: "Buku gagal dihapus. Id tidak ditemukan"
	});
	response.code(404);
	return response;
};

module.exports = {
	addBooksHandler,
	getAllBooksHandler,
	getBookByIdHandler,
	editBookByIdHandler,
	deleteBookByIdHandler
};
