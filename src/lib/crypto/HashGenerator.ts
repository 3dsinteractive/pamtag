import * as CryptoJS from "crypto-js";

export class HashGenerator {
  public sha256(data: string): string {
    const hash = CryptoJS.SHA256(data);
    return hash.toString(CryptoJS.enc.Hex);
  }
}
