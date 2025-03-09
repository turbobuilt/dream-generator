class AiChatModel {
  String? id;
  String? label;
  double? inputTokenLimit;
  double? outputTokenLimit;
  double? inputTokenCost;
  double? outputTokenCost;

  AiChatModel({
    this.id,
    this.label,
    this.inputTokenLimit,
    this.outputTokenLimit,
    this.inputTokenCost,
    this.outputTokenCost,
  });

  AiChatModel.fromJson(Map<String, dynamic> json) {
    id = json['id'];
    label = json['label'];
    inputTokenLimit = json['inputTokenLimit'];
    outputTokenLimit = json['outputTokenLimit'];
    inputTokenCost = json['inputTokenCost'];
    outputTokenCost = json['outputTokenCost'];
  }

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = <String, dynamic>{};
    data['id'] = id;
    data['label'] = label;
    data['inputTokenLimit'] = inputTokenLimit;
    data['outputTokenLimit'] = outputTokenLimit;
    data['inputTokenCost'] = inputTokenCost;
    data['outputTokenCost'] = outputTokenCost;
    return data;
  }
}