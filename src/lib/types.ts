export enum EngineType {
	ONNX = 'ONNX!',
	TVM = 'TVM',
}

export enum OctType {
	BENCHMARK = 'benchmark',
	ACCELERATE = 'accelerate',
}

export interface OctState {
	[key: string]: {
		selected: boolean;
		engineType: EngineType;
		num_trials?: number;
		runs_per_trial?: number;
		engine: EngineType | { [key: string]: { kernel_trials: number } };
	};
}

export interface HardwareTargetsShape {
	provider: string;
	instance: string;
	cpu: number;
	memory: number;
}

export interface OctoActions {
	[key: string]: {
		engine: EngineType;
		hardware: HardwareTargetsShape;
		num_trials?: number;
		runs_per_trial?: number;
	}[];
}

export interface MappedHardwareTargets {
	[key: string]: {
		[key: string]: {
			cpu: number;
			memory: number;
		};
	};
}
