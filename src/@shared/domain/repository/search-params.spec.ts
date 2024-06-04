import { SearchParams } from "./search-params";

describe("SearchParams Unit Tests", () => {
  describe("page prop", () => {
    it("should create with defaults", () => {
      const params = new SearchParams();
      expect(params.page).toBe(1);
    });

    it.each([
      { page: null, expected: 1 },
      { page: undefined, expected: 1 },
      { page: "", expected: 1 },
      { page: "fake", expected: 1 },
      { page: 0, expected: 1 },
      { page: -1, expected: 1 },
      { page: 5.5, expected: 1 },
      { page: true, expected: 1 },
      { page: false, expected: 1 },
      { page: {}, expected: 1 },
      { page: 1, expected: 1 },
      { page: 2, expected: 2 },
    ])(
      "should set page to $expected when input is { page: $page }",
      ({ page, expected }) => {
        expect(new SearchParams({ page: page as any }).page).toBe(expected);
      }
    );
  });

  describe("per_page prop", () => {
    it("should create with defaults", () => {
      const params = new SearchParams();
      expect(params.per_page).toBe(15);
    });

    it.each([
      { per_page: null, expected: 15 },
      { per_page: undefined, expected: 15 },
      { per_page: "", expected: 15 },
      { per_page: "fake", expected: 15 },
      { per_page: 0, expected: 15 },
      { per_page: -1, expected: 15 },
      { per_page: 5.5, expected: 15 },
      { per_page: true, expected: 15 },
      { per_page: false, expected: 15 },
      { per_page: {}, expected: 15 },

      { per_page: 1, expected: 1 },
      { per_page: 2, expected: 2 },
      { per_page: 10, expected: 10 },
    ])(
      "should set per_page to $expected when input is { per_page: $per_page }",
      ({ per_page, expected }) => {
        expect(new SearchParams({ per_page: per_page as any }).per_page).toBe(
          expected
        );
      }
    );
  });

  describe("sort prop", () => {
    it("should create with defaults", () => {
      const params = new SearchParams();
      expect(params.sort).toBeNull();
    });

    it.each([
      { sort: null, expected: null },
      { sort: undefined, expected: null },
      { sort: "", expected: null },
      { sort: 0, expected: "0" },
      { sort: -1, expected: "-1" },
      { sort: 5.5, expected: "5.5" },
      { sort: true, expected: "true" },
      { sort: false, expected: "false" },
      { sort: {}, expected: "[object Object]" },
      { sort: "field", expected: "field" },
    ])(
      "should set sort to $expected when input is { sort: $sort }",
      ({ sort, expected }) => {
        expect(new SearchParams({ sort: sort as any }).sort).toBe(expected);
      }
    );
  });

  describe("sort_dir prop", () => {
    it("should create with defaults", () => {
      const params = new SearchParams();
      expect(params.sort_dir).toBeNull();
    });

    it.each([null, undefined, ""])(
      "should set sort_dir to null when sort is `%s`",
      (sort) => {
        expect(new SearchParams({ sort }).sort_dir).toBeNull();
      }
    );

    it.each([
      { sort: "field", sort_dir: null, expected: "asc" },
      { sort: "field", sort_dir: undefined, expected: "asc" },
      { sort: "field", sort_dir: "", expected: "asc" },
      { sort: "field", sort_dir: 0, expected: "asc" },
      { sort: "field", sort_dir: "fake", expected: "asc" },
      { sort: "field", sort_dir: "asc", expected: "asc" },
      { sort: "field", sort_dir: "ASC", expected: "asc" },
      { sort: "field", sort_dir: "desc", expected: "desc" },
      { sort: "field", sort_dir: "DESC", expected: "desc" },
    ])(
      "should set sort_dir to $expected when input is { sort: $sort, sort_dir: `$sort_dir` }",
      (input) => {
        expect(new SearchParams(input as any).sort_dir).toBe(input.expected);
      }
    );
  });

  describe("filter prop", () => {
    it("should create with defaults", () => {
      const params = new SearchParams();
      expect(params.filter).toBeNull();
    });

    it.each([
      { filter: null, expected: null },
      { filter: undefined, expected: null },
      { filter: "", expected: null },
      { filter: 0, expected: "0" },
      { filter: -1, expected: "-1" },
      { filter: 5.5, expected: "5.5" },
      { filter: true, expected: "true" },
      { filter: false, expected: "false" },
      { filter: {}, expected: "[object Object]" },
      { filter: "field", expected: "field" },
    ])(
      "should set filter to `$expected` when input is { filter: `$expected` }",
      ({ filter, expected }) => {
        expect(new SearchParams({ filter }).filter).toBe(expected);
      }
    );
  });
});
