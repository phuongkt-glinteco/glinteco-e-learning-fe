import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class AutoAnswerDto {
  @ApiProperty({ description: 'ID câu hỏi trong questionsData' })
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @ApiProperty({ description: 'Câu trả lời của học viên' })
  @IsString()
  answer: string;
}

export class SubmitAutoDto {
  @ApiProperty({ type: [AutoAnswerDto] })
  @IsArray({ message: 'answers phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => AutoAnswerDto)
  answers: AutoAnswerDto[];
}

export class AutoGradeQuestionResultDto {
  @ApiProperty()
  questionId: string;

  @ApiProperty()
  correct: boolean;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Explanation revealed after an auto-graded submission.',
  })
  explanation?: string | null;
}

export class AutoGradeResultDto {
  @ApiProperty({ example: 80, description: 'Điểm (%) của lần làm này' })
  score: number;

  @ApiProperty({ example: 4 })
  correctCount: number;

  @ApiProperty({ example: 5 })
  totalQuestions: number;

  @ApiProperty({ example: 80, description: 'Điểm (%) tối thiểu để đạt' })
  targetScore: number;

  @ApiProperty({ example: true, description: 'Lần làm này đạt hay không' })
  passed: boolean;

  @ApiProperty({
    example: true,
    description:
      'Trạng thái hoàn thành bài tập trong DB (không đổi khi làm lại sau khi đã đạt)',
  })
  completed: boolean;

  @ApiProperty({ type: [AutoGradeQuestionResultDto] })
  results: AutoGradeQuestionResultDto[];
}
