
import 'Serializable.dart';

@reflector
class Prompt extends Serializable {
  int? id;
  int? created;
  int? updated;
  int? createdBy;
  int? updatedBy;
  int? promptCategory;
  String text = "";
  String title = "";
  String style = "";
  int? authenticatedUser;
  int? likesCount;
  String? uploadUrl;
  int? uploaded;
  int? sharedImage;
}
