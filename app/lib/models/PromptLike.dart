
import 'Serializable.dart';


@reflector
class PromptLike extends Serializable{
  int? id;
  int? created;
  int? updated;
  int? createdBy;
  int? updatedBy;
  int? prompt;
  int? authenticatedUser;
}
