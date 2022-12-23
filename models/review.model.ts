import Customer from "./customer.model";

export default interface Review {
  id: number;
  customer: Customer; // Review를 통하지 않고도 사용할 수 있어야할 확률이 있는 nested object는 Type 따로 분리
  hospital_id: number;
  hospital_name: string;
  doctor_id: number;
  doctor_name: string;
  total_score: number;
  score_service_clarity: number;
  score_service_kindness: number;
  score_treatment_explain: number;
  score_treatment_outcome: number;
  registered_at: string;
  visited_at: string;
  treatment_prices: {
    name: string;
    price: string;
  }[];
  contents: string;
  suggest: boolean;
  liked_cnt: number;
  already_liked: boolean;
}
