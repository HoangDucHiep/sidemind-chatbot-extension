import { describe, it, expect, beforeEach } from "vitest";
import { historyService, type Conversation } from "../lib/history";
import { storage } from "../lib/storage";

describe("Conversation History Service (CRUD + LRU)", () => {
  beforeEach(async () => {
    await storage.clear();
    await historyService.clearAll();
  });

  it("should save and retrieve a conversation by ID", async () => {
    const convo: Conversation = {
      id: "convo-123",
      title: "Testing React Architecture",
      timestamp: Date.now(),
      model: "gpt-4o-mini",
      provider: "openai",
      tags: ["react", "dev"],
      messageCount: 2,
      messages: [
        { id: "m1", role: "user", content: "Hello", timestamp: Date.now() },
        {
          id: "m2",
          role: "assistant",
          content: "Hi there!",
          timestamp: Date.now(),
        },
      ],
    };

    await historyService.save(convo);

    const list = await historyService.getList();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe("convo-123");
    expect(list[0].title).toBe("Testing React Architecture");

    const retrieved = await historyService.getById("convo-123");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.messages.length).toBe(2);
    expect(retrieved?.messages[1].content).toBe("Hi there!");
  });

  it("should update existing conversation and place it at head (LRU)", async () => {
    const convo1: Conversation = {
      id: "convo-1",
      title: "First Chat",
      timestamp: 1000,
      model: "gemini-3.6-flash",
      provider: "gemini",
      tags: [],
      messageCount: 1,
      messages: [{ id: "m1", role: "user", content: "1", timestamp: 1000 }],
    };

    const convo2: Conversation = {
      id: "convo-2",
      title: "Second Chat",
      timestamp: 2000,
      model: "claude-3-5-sonnet",
      provider: "anthropic",
      tags: [],
      messageCount: 1,
      messages: [{ id: "m2", role: "user", content: "2", timestamp: 2000 }],
    };

    await historyService.save(convo1);
    await historyService.save(convo2);

    let list = await historyService.getList();
    expect(list.length).toBe(2);
    expect(list[0].id).toBe("convo-2");
    expect(list[1].id).toBe("convo-1");

    // Updating convo1 should move it to top
    const updatedConvo1 = {
      ...convo1,
      title: "Updated First Chat",
      timestamp: 3000,
    };
    await historyService.save(updatedConvo1);

    list = await historyService.getList();
    expect(list.length).toBe(2);
    expect(list[0].id).toBe("convo-1");
    expect(list[0].title).toBe("Updated First Chat");
  });

  it("should delete a conversation", async () => {
    const convo: Conversation = {
      id: "del-1",
      title: "To Delete",
      timestamp: Date.now(),
      model: "gpt-4o",
      provider: "openai",
      tags: [],
      messageCount: 1,
      messages: [
        { id: "m1", role: "user", content: "Del", timestamp: Date.now() },
      ],
    };

    await historyService.save(convo);
    expect((await historyService.getList()).length).toBe(1);

    await historyService.delete("del-1");
    expect((await historyService.getList()).length).toBe(0);
    expect(await historyService.getById("del-1")).toBeNull();
  });

  it("should search conversations by title, model, or tags", async () => {
    await historyService.save({
      id: "c1",
      title: "YouTube Summary on Transformers",
      timestamp: 100,
      model: "gemini-3.6-flash",
      provider: "gemini",
      tags: ["ai", "youtube"],
      messageCount: 1,
      messages: [],
    });

    await historyService.save({
      id: "c2",
      title: "PDF Review on Economics",
      timestamp: 200,
      model: "gpt-4o-mini",
      provider: "openai",
      tags: ["finance"],
      messageCount: 1,
      messages: [],
    });

    const searchYoutube = await historyService.search("youtube");
    expect(searchYoutube.length).toBe(1);
    expect(searchYoutube[0].id).toBe("c1");

    const searchGpt = await historyService.search("gpt");
    expect(searchGpt.length).toBe(1);
    expect(searchGpt[0].id).toBe("c2");

    const searchEmpty = await historyService.search("nonexistent");
    expect(searchEmpty.length).toBe(0);
  });
});
