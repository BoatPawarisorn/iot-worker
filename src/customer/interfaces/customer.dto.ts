export class ICustomer {
  readonly id: number;
  readonly customerId: number;
  readonly projectId: number;
  readonly serial: string;
  readonly detail: string;
  readonly address: string;
  readonly provinceId: number;
  readonly provinceName: string;
  readonly districtId: number;
  readonly districtName: string;
  readonly subdistrictId: number;
  readonly subdistrictName: string;
  readonly lat: string;
  readonly lon: string;
  readonly createdAt: Date;
  readonly createdBy: string;
  readonly updatedAt: Date;
  readonly updatedBy: string;
  readonly deletedAt: Date;
  readonly deletedBy: string;
}
