import { BaseContract, EventLog, Log } from "ethers";
import { Contract } from "ethers";
import { ContractTransactionReceipt, ContractTransactionResponse, EventFragment } from "ethers";
import { TypedContractEvent } from "../../typechain-types/common";


export async function obtainEvent(contract: BaseContract, response: Promise<ContractTransactionResponse>, eventName: string): Promise<EventLog | Log> {
    // Run transaction and wait for receipt
    const receipt = await (await response).wait();
    if (receipt === undefined || receipt?.status !== 1) {
        throw new Error(`Transaction failed or reverted: ${receipt}`);
    }

    // Safe-guards: Lookup event in contract ABI
    let eventFragment: EventFragment | null = null;
    try {
        eventFragment = contract.interface.getEvent(eventName);
    } catch (e) {
        // ignore error
    }

    if (eventFragment === null) {
        throw new Error(`Event "${eventName}" doesn't exist in the contract`);
    }
    const topic = eventFragment.topicHash;
    const contractAddress = contract.target;
    const logs = receipt.logs
        .filter((log) => log.topics.includes(topic))
        .filter(
            (log) => log.address.toLowerCase() === (contractAddress as string).toLowerCase()
        );

    if (logs.length === 0) {
        throw new Error(`No event emitted with name "${eventName}"`);
    }

    return logs[0];
}

export async function obtainEventWithArgs(contract: BaseContract, response: Promise<ContractTransactionResponse>, eventName: string): Promise<EventLog> {
    const e = await obtainEvent(contract, response, eventName);
    if (!isEventLog(e)) {
        throw new Error(`Event "${eventName}" doesn't contain arguments`);
    }
    return e;
}


export async function obtainEventWithArgsTypes<R>(contract: BaseContract, response: Promise<ContractTransactionResponse>, event: TypedContractEvent<any, any, R>): Promise<{
    log: EventLog;
    result: R;
}> {
    const e = await obtainEventWithArgs(contract, response, event.name);
    const fragment = event.getFragment();

    if (fragment.name !== event.name) {
        throw new Error(`Event "${event.name}" doesn't exist in the contract - fragment mismatch`);
    }

    const map: Map<string, any> = new Map<string, any>();
    event.getFragment().inputs.forEach((input, index) => {
        map.set(input.name, e.args[index]);
    });
    const obj = mapToObject(map);
    return { log: e, result: obj as R };
}


export function isEventLog(log: EventLog | Log): log is EventLog {
    return (log as EventLog).args !== undefined;
}

export function mapToObject<K extends string, V>(map: Map<K, V>): { [key in K]: V } {
    const obj: { [key in K]: V } = {} as { [key in K]: V };
    map.forEach((value, key) => {
        obj[key] = value;
    });
    return obj;
}