const USERNAME = "C3_THIENLMN";
const PASSWORD = "abcd@1234";

async function signIn(driver) {
  await driver.findElement(By.name("txtUserName")).sendKeys(USERNAME || "");
  // await driver.findElement(By.name("txtPassword")).sendKeys(PASSWORD || "");
  // await driver.findElement(By.name("DONE")).click();
}

module.exports = { signIn };
