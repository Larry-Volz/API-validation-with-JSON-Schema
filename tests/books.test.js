process.env.NODE_ENV = "test";

const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let book_isbn;


/**before all create
    correct data to enter
    incorrect isbn
    incorrect other fields
*/
beforeEach(async () => {
    await db.query("DELETE FROM books");

    let result = await db.query(`
      INSERT INTO
        books (isbn, amazon_url,author,language,pages,publisher,title,year)
        VALUES(
          '01234',
          'https://www.magicComedian.net',
          'Larry Volz',
          'English',
          1000,
          'How to Play in Traffic',
          'How to Drink too much Caffeine', 2021)
        RETURNING isbn`);
  
    book_isbn = result.rows[0].isbn
  });

  describe("GET /books", function() {
    test("Gets a list of 1 book", async function () {
      const response = await request(app).get(`/books`);
      const books = response.body.books;
      expect(books).toHaveLength(1);
      expect(books[0]).toHaveProperty("isbn");
      expect(books[0]).toHaveProperty("amazon_url");
    });
  });


    describe("POST a new book to /books", function () {
        test("Posts a new book", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({
                isbn: '072702111206',
                amazon_url: "https://familytime.com",
                author: "Testy Testerson",
                language: "english",
                pages: 1000,
                publisher: "self",
                title: "Who ate the pie?",
                year: 2021
            });

            /**tests if correct values return correct response */
            expect(response.statusCode).toBe(201);
            expect(response.body.book).toHaveProperty("isbn");
        });

    test("book missing title", async function () {
        const response = await request(app)
            .post(`/books`)
            .send({name: "test name"}); //only sending one element of the JSON should fail

            /**tests if incorrect values return correct errors */
            expect(response.statusCode).toBe(400);
      });
    });

    describe("GET /books/:isbn", function () {
    test("Gets a single book", async function () {
        const response = await request(app)
            .get(`/books/${book_isbn}`)
        expect(response.body.book).toHaveProperty("isbn");
        expect(response.body.book.isbn).toBe(book_isbn);
    });

    test("404 error if book not found", async function () {
        const response = await request(app)
            .get(`/books/987654321`)
        expect(response.statusCode).toBe(404);
    });
    });


    describe("PUT /books/:id", function () {
        test("Updates a single book", async function () {
            const response = await request(app)
                .put(`/books/${book_isbn}`)
                .send({
                    amazon_url: "https://familytime.com",
                    author: "Testy Testerson",
                    language: "english",
                    pages: 1000,
                    publisher: "self",
                    title: "Who ate the pie?",
                    year: 2021
                });
  
            expect(response.body.book).toHaveProperty("isbn");
            expect(response.body.book.title).toBe("UPDATED BOOK");
        });
        
        });
        
        



afterAll(async function() {
    // close db connection
    await db.end();
  });