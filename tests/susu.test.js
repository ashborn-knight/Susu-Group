// susu-group/tests/susu.test.js
const { SusuGroup } = require("../main");

describe("SusuGroup", () => {
  let group;

  beforeEach(() => {
    group = new SusuGroup(50);
    group.addMember("Ama");
    group.addMember("Kofi");
    group.addMember("Esi");
  });

  test("rejects duplicate members", () => {
    expect(() => group.addMember("Ama")).toThrow("Duplicate member");
  });

  test("records full payments", () => {
    group.recordPayment("Ama", 50);
    expect(group.report().members["Ama"]).toBe("50.00");
  });

  test("allows partial payments", () => {
    group.recordPayment("Esi", 30);
    expect(group.report().members["Esi"]).toBe("30.00");
  });

  test("prevents overpayment", () => {
    group.recordPayment("Ama", 50);
    expect(() => group.recordPayment("Ama", 10)).toThrow("Payment exceeds weekly amount");
  });

  test("week cannot close if someone owes", () => {
    group.recordPayment("Ama", 50);
    group.recordPayment("Kofi", 50);
    group.recordPayment("Esi", 30);
    const result = group.closeWeek();
    expect(result.status).toBe("incomplete");
    expect(result.debts["Esi"]).toBe("20.00");
  });

  test("week closes correctly when all paid", () => {
    group.recordPayment("Ama", 50);
    group.recordPayment("Kofi", 50);
    group.recordPayment("Esi", 50);
    const result = group.closeWeek();
    expect(result.status).toBe("paid");
    expect(result.recipient).toBe("Ama");
    expect(result.amount).toBe("150.00");
  });
});
