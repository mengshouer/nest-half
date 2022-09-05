import { UpdateUserDto } from './../users/dto/update-user.dto';
import { QLDto } from './dto/ql.dto';
import { HttpException, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { request } from './http';
import { UsersService } from '../users/users.service';

@Injectable()
export class QLService {
  constructor(private readonly usersService: UsersService) {
    this.updateheaders();
  }

  // * 初始化
  @Cron('3 3 */25 * *')
  async updateheaders() {
    request.extendOptions({
      prefix: process.env.QL_ADDRESS || 'http://127.0.0.1:5700',
    });
    request
      .get('/open/auth/token', {
        params: {
          client_id: process.env.QL_CLIENT_ID || '',
          client_secret: process.env.QL_CLIENT_SECRET || '',
        },
        headers: {
          Authorization: '',
        },
      })
      .then((res) => {
        request.extendOptions({
          headers: {
            Authorization: `Bearer ${res.data.token}`,
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  async getres() {
    return await request.get('/open/envs?searchValue=');
  }

  // type: 0: 删除  1: 新增/更新
  async handler(type: number, QLDto: QLDto, user: string) {
    const pin_rex = /pt_pin=(.*?);/;
    const pt_pin = pin_rex.exec(QLDto.cookie);
    if (!pt_pin)
      throw new HttpException({ message: 'Cookie错误！找不到pt_pin值' }, 444);
    let pt_key: RegExpExecArray = null;
    if (type !== 0) {
      const key_rex = /pt_key=(.*?);/;
      pt_key = key_rex.exec(QLDto.cookie);
      if (!pt_key)
        throw new HttpException({ message: 'Cookie错误！找不到pt_key值' }, 444);
    }
    // // // 获取环境变量更新
    await this.getres().then(async (res) => {
      let id = '';
      for (let i = 0; i < res.data.length; i++) {
        const element = res.data[i];
        if (element.name === 'JD_COOKIE') {
          const e_pt_pin = pin_rex.exec(element.value);
          if (e_pt_pin && pt_pin[1] === e_pt_pin[1]) {
            id = element._id;
            break;
          }
        }
      }
      if (type === 0) {
        if (id) await this.delete(id);
      } else {
        const fcookie = `pt_key=${pt_key[1]};pt_pin=${pt_pin[1]};`;
        await this.update(id, fcookie, QLDto.remarks);
      }
    });
    // * 更新数据库
    await this.usersService.findOne(user).then(async (res) => {
      const cookie_list = res.cookie
        ? res.cookie.filter((item) => !item.match(pt_pin[1]))
        : [];
      const data: UpdateUserDto = {
        username: user,
        password: res.password,
        cookie: type === 0 ? cookie_list : [...cookie_list, pt_pin[1]],
      };
      await this.usersService.update(data);
    });
  }

  async delete(id: string) {
    await request.delete('/open/envs', {
      data: [`${id}`],
    });
  }

  async update(id: string, cookie: string, remarks?: string) {
    const data = [
      {
        name: 'JD_COOKIE',
        value: cookie,
      },
    ];
    if (remarks) data[0]['remarks'] = remarks;
    if (id) {
      // 如果id存在，则更新
      data[0]['_id'] = id;
      await request
        .put('/open/envs', {
          data: data[0],
        })
        .then(async () => {
          await this.enable(id);
        });
    } else {
      // 新增
      await request.post('/open/envs', {
        data: data,
      });
    }
  }

  // 启用环境变量
  async enable(id: string) {
    await request.put('/open/envs/enable', {
      data: [`${id}`],
    });
  }

  async addcookie(user: string, QLDto: QLDto) {
    let msg = {};
    await this.handler(1, QLDto, user)
      .then(() => {
        msg = { code: 200, message: 'success' };
      })
      .catch((err) => {
        if (err.status === 444) {
          throw new HttpException(err.response.message, 400);
        }
        throw new HttpException(err.data || err.response.message, err.status);
      });
    return msg;
  }

  async delcookie(user: string, QLDto: QLDto) {
    let msg = {};
    await this.handler(0, QLDto, user)
      .then(() => {
        msg = { code: 200, message: 'success' };
      })
      .catch((err) => {
        if (err.status === 444) {
          throw new HttpException(err.response.message, 400);
        }
        throw new HttpException(err.data || err.response.message, err.status);
      });
    return msg;
  }
}
