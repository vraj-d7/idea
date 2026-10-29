import { describe, expect, it } from "vitest";
import { withAffiliateTag } from "./affiliate";

describe("withAffiliateTag", () => {
  it("adds the tag when configured", () => {
    expect(withAffiliateTag("https://www.amazon.in/dp/B0TEST", "tag", "mystore-21")).toBe(
      "https://www.amazon.in/dp/B0TEST?tag=mystore-21",
    );
  });

  it("keeps existing query params and replaces an old tag", () => {
    expect(withAffiliateTag("https://shop.example/p?id=4&tag=old", "tag", "new")).toBe(
      "https://shop.example/p?id=4&tag=new",
    );
  });

  it("leaves the URL alone when not configured", () => {
    expect(withAffiliateTag("https://shop.example/p", "", "")).toBe("https://shop.example/p");
  });

  it("leaves invalid URLs alone", () => {
    expect(withAffiliateTag("not a url", "tag", "x")).toBe("not a url");
  });
});
