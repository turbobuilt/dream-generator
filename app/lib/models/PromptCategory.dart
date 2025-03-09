
import 'Serializable.dart';


@reflector
class PromptCategory extends Serializable{
  int? id;
  int? created;
  int? updated;
  int? createdBy;
  int? updatedBy;
  String name = "";
}
