import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Customer } from './entities/customer.entity';
import { ICustomer } from './interfaces/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    readonly customerRepository: Repository<Customer>,
  ) {}

  public async findAll(): Promise<ICustomer[]> {
    const res = await this.customerRepository.find();
    // console.log(res)
    if (!res) {
      throw new NotFoundException(`Data not found`);
    }

    return res;
  }
}
