import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ContractTerm } from './interfaces/contract-terms.interface';
import { CreateContractTermDto } from './dto/create-contract-terms.dto';
import { UpdateContractTermDto } from './dto/update-contract-terms.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';

@Injectable()
export class ContractTermsService {
  constructor(
    @InjectModel('ContractTerm')
    private readonly contractTermModel: Model<ContractTerm>,
  ) {}

  async createContractTerm(
    createContractTermDto: CreateContractTermDto,
  ): Promise<ContractTerm> {
    const newContractTerm = await this.contractTermModel.create(
      createContractTermDto,
    );
    return newContractTerm;
  }

  async findContractTerms(): Promise<ContractTerm[]> {
    return this.contractTermModel.find().sort({ createdAt: -1 });
  }

  async findByIdContractTerm(id: string): Promise<ContractTerm> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const contractTerm = await this.contractTermModel.findById(id);
    if (!contractTerm) {
      throw new NotFoundException(`Không tìm thấy điều khoản với ID: ${id}`);
    }
    return contractTerm;
  }

  async updateContractTerm(
    id: string,
    updateContractTermDto: UpdateContractTermDto,
  ): Promise<ContractTerm> {
    const contractTerm = await this.contractTermModel.findByIdAndUpdate(
      id,
      updateContractTermDto,
      {
        new: true,
      },
    );

    if (!contractTerm) {
      throw new NotFoundException(`Không tìm thấy điều khoản với ID ${id}`);
    }
    return contractTerm;
  }

  async removeContractTerm(id: string): Promise<ResponseInterface> {
    const result = await this.contractTermModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy điều khoản với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Điều khoản với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
