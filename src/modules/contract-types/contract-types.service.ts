import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { ContractType } from './interfaces/contract-types.interface';
import { CreateContractTypeDto } from './dto/create-contract-types.dto';
import { UpdateContractTypeDto } from './dto/update-contract-types.dto';
import { ResponseInterface } from 'src/interfaces/response.interface';

@Injectable()
export class ContractTypesService {
  constructor(
    @InjectModel('ContractType')
    private readonly contractTypeModel: Model<ContractType>,
  ) {}

  async createContractType(
    createContractTypeDto: CreateContractTypeDto,
  ): Promise<ContractType> {
    const newContractType = await this.contractTypeModel.create(
      createContractTypeDto,
    );
    return newContractType;
  }

  async findContractTypes(): Promise<ContractType[]> {
    return this.contractTypeModel.find().sort({ createdAt: -1 });
  }

  async findByIdContractType(id: string): Promise<ContractType> {
    if (!isValidObjectId(id)) {
      throw new NotFoundException(`ID ${id} không hợp lệ.`);
    }

    const contractType = await this.contractTypeModel.findById(id);
    if (!contractType) {
      throw new NotFoundException(`Không tìm thấy loại hợp đồng với ID: ${id}`);
    }
    return contractType;
  }

  async updateContractType(
    id: string,
    updateContractTypeDto: UpdateContractTypeDto,
  ): Promise<ContractType> {
    const contractType = await this.contractTypeModel.findByIdAndUpdate(
      id,
      updateContractTypeDto,
      {
        new: true,
      },
    );

    if (!contractType) {
      throw new NotFoundException(`Không tìm thấy loại hợp đồng với ID ${id}`);
    }
    return contractType;
  }

  async removeContractType(id: string): Promise<ResponseInterface> {
    const result = await this.contractTypeModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Không tìm thấy loại hợp đồng với ID ${id}`);
    }

    return {
      statusCode: HttpStatus.ACCEPTED,
      message: `Loại hợp đồng với ID ${id} đã được xóa thành công.`,
      messageCode: 'DELETE_SUCCESS',
    };
  }
}
