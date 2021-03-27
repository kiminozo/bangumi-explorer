declare module 'segment' {

    interface SegmentOptions {
        stripPunctuation?: boolean;
        convertSynonym?: boolean;
        stripStopword?: boolean;
    }

    interface SegmentResult {
        w: string;
        p: number;
    }

    declare class Segment {


        constructor()

        useDefault(): void;

        doSegment(text: string, options?: SegmentOptions): SegmentResult[]


    }
}