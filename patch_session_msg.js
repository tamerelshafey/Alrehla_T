const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');
code = code.replace(
`export interface SessionMessage {
  id: string;
  senderName: string;
  message: string;
  createdAt: string;
}`,
`export interface SessionMessage {
  id: string;
  sessionId: string;
  senderName: string;
  message: string;
  createdAt: string;
}`);
code = code.replace(
`export interface SessionAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
}`,
`export interface SessionAttachment {
  id: string;
  sessionId: string;
  fileName: string;
  fileUrl: string;
}`);
fs.writeFileSync('src/types/index.ts', code);
