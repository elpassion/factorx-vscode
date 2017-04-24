// @flow

import { spawnSync, spawn } from 'child_process';

const getFlowFactorCommand = () =>
  spawnSync('which', ['factorx']).stdout.toString().trim();

const executeCommand = ({
  command,
  args,
  input,
}: { command: string, args: Array<any>, input: string }): Promise<any> =>
  new Promise((resolve, reject) => {
    const flowCommand = getFlowFactorCommand();
    if (!flowCommand) reject('Could not find "FactorX" binary.');
    try {
      const spawnedProcess = spawn(flowCommand, [command, ...args]);
      spawnedProcess.stdout.on('data', (data) => {
        const parsedData = JSON.parse(data);
        if (parsedData.status === 'ok') {
          resolve(parsedData);
        } else {
          reject(parsedData.error);
        }
      });
      spawnedProcess.stderr.on('data', (error) => {
        reject(error);
      });
      spawnedProcess.stdin.end(input);
    } catch (error) {
      reject(error);
    }
  });

export default executeCommand;
