import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Controller, Req, UseGuards, Post, Body } from '@nestjs/common';
import { QLDto } from './dto/ql.dto';
import { QLService } from './ql.service';

@Controller('ql')
export class QLController {
  constructor(private readonly qlService: QLService) {}

  @UseGuards(JwtAuthGuard)
  @Post('jdck/update')
  updatecookie(@Req() req, @Body() QLDto: QLDto) {
    return this.qlService.addcookie(req.user.username, QLDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('jdck/delete')
  delcookie(@Req() req, @Body() QLDto: QLDto) {
    return this.qlService.delcookie(req.user.username, QLDto);
  }
}
