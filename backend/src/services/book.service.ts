import bookRepository from '../repositories/book.repository';
import { CreateBookInput, UpdateBookInput, BookQueryInput } from '../validators/book.validator';
import { parsePagination, buildPaginationMeta } from '../utils/pagination';
import { NotFoundError, DuplicateEntryError, BadRequestError } from '../errors/app-error';

export class BookService {
  async findAll(query: BookQueryInput) {
    const pagination = parsePagination(query.page, query.perPage);

    const { data, total } = await bookRepository.findAll({
      search: query.search,
      category: query.category,
      sort: query.sort,
      order: query.order,
      pagination,
    });

    return {
      data,
      meta: buildPaginationMeta(total, pagination),
    };
  }

  async findById(id: string) {
    const book = await bookRepository.findById(id);
    if (!book) {
      throw new NotFoundError('Buku', id);
    }
    return book;
  }

  async create(input: CreateBookInput) {
    // Check ISBN uniqueness
    const existing = await bookRepository.findByIsbn(input.isbn);
    if (existing) {
      throw new DuplicateEntryError([
        { field: 'isbn', message: `ISBN ${input.isbn} sudah terdaftar dalam sistem` },
      ]);
    }

    return bookRepository.create({
      ...input,
      availableCopies: input.totalCopies,
    });
  }

  async update(id: string, input: UpdateBookInput) {
    const book = await bookRepository.findById(id);
    if (!book) {
      throw new NotFoundError('Buku', id);
    }

    // Check ISBN uniqueness (exclude self)
    const existingIsbn = await bookRepository.findByIsbn(input.isbn, id);
    if (existingIsbn) {
      throw new DuplicateEntryError([
        { field: 'isbn', message: `ISBN ${input.isbn} sudah digunakan oleh buku lain` },
      ]);
    }

    // Validate totalCopies >= currently borrowed
    const activeLoans = await bookRepository.countActiveLoans(id);
    if (input.totalCopies < activeLoans) {
      throw new BadRequestError(
        'INVALID_TOTAL_COPIES',
        `Total eksemplar tidak boleh kurang dari ${activeLoans} (jumlah yang sedang dipinjam)`
      );
    }

    // Recalculate availableCopies
    const availableCopies = input.totalCopies - activeLoans;

    return bookRepository.update(id, {
      ...input,
      availableCopies,
    });
  }

  async delete(id: string) {
    const book = await bookRepository.findById(id);
    if (!book) {
      throw new NotFoundError('Buku', id);
    }

    // Check if book has any loans (active or historical)
    const activeLoans = await bookRepository.countActiveLoans(id);
    if (activeLoans > 0) {
      throw new BadRequestError(
        'BOOK_HAS_ACTIVE_LOANS',
        `Buku "${book.title}" masih dipinjam oleh ${activeLoans} anggota`
      );
    }

    // Try to delete — Prisma will throw if there are historical loans (RESTRICT)
    try {
      await bookRepository.delete(id);
    } catch {
      throw new BadRequestError(
        'BOOK_HAS_ACTIVE_LOANS',
        `Buku "${book.title}" memiliki riwayat peminjaman dan tidak dapat dihapus`
      );
    }

    return { id: book.id, title: book.title };
  }

  async getCategories() {
    return bookRepository.getCategories();
  }
}

export default new BookService();
