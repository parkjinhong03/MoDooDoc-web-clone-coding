import Customer from "./customer.model";

export default interface Review {
  id: number;
  customer: Customer; // Review를 통하지 않고도 사용할 수 있어야할 확률이 있는 nested object는 Type 따로 분리
  hospitalId: number;
  hospitalName: string;
  doctorId: number;
  doctorName: string;
  totalScore: number;
  scoreServiceClarity: number;
  scoreServiceKindness: number;
  scoreTreatmentExplain: number;
  scoreTreatmentOutcome: number;
  registeredAt: string;
  visitedAt: string;
  treatmentPrices: {
    name: string;
    price: number;
  }[];
  contents: string;
  suggest: boolean;
  likedCnt: number;
  alreadyLiked: boolean;
}
